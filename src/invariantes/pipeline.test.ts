import { describe, expect, it } from "vitest";
import pipelineYml from "../../.github/workflows/pipeline.yml?raw";
import { validarPipeline } from "./pipeline";

describe("concurrency da esteira", () => {
  it("aceita o pipeline.yml atual", () => {
    expect(() => validarPipeline(pipelineYml)).not.toThrow();
  });

  it("reprova concurrency no nível do workflow, o #15", () => {
    const sabotado = pipelineYml.replace(
      "permissions:\n  contents: read\n\njobs:",
      "permissions:\n  contents: read\n\nconcurrency:\n  group: pipeline-${{ github.ref }}\n  cancel-in-progress: ${{ github.event_name == 'pull_request' }}\n\njobs:",
    );
    expect(sabotado).toContain("group: pipeline-${{ github.ref }}");
    expect(() => validarPipeline(sabotado)).toThrow(/concurrency no nível do workflow/);
  });

  it("reprova deploy sem cancel-in-progress: false", () => {
    const sabotado = pipelineYml.replace(
      /cd_prd:[\s\S]*?concurrency:\n\s+group: deploy-prd-\$\{\{ github\.ref \}\}\n\s+cancel-in-progress: false/,
      (bloco) => bloco.replace("cancel-in-progress: false", "cancel-in-progress: true"),
    );
    expect(() => validarPipeline(sabotado)).toThrow(/cd_prd.*cancel-in-progress: false/s);
  });

  it("reprova HML/PRD sem o if da main — num PR esses jobs precisam aparecer skipped", () => {
    const sabotado = pipelineYml.replace(
      "if: github.event_name == 'push' && github.ref == 'refs/heads/main' && needs.cd_dev.result == 'success'",
      "if: always()",
    );
    expect(() => validarPipeline(sabotado)).toThrow(/cd_hml precisa rodar só no push da main/);
  });
});
