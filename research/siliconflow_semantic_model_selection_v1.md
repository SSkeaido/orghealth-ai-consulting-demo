# 硅基流动企业问题语义解析模型选型 V1

更新日期：2026-07-22

## 结论

默认模型采用 `deepseek-ai/DeepSeek-V3.2`，并将模型 ID 保留为服务端环境变量。这个选择是基于当前官方能力说明、JSON 模式支持和成本作出的工程判断，不代表已经通过本项目真实标注集证明其质量最高。

## 选择理由

- 企业自述解析需要中文长文本理解、竞争假设检查、指令遵循和稳定结构化输出。
- 硅基流动官方将 DeepSeek-V3.2 定位为复杂推理、Agent 和长文本模型；Chat Completions 支持关闭思考模式，适合低延迟结构化抽取。
- 硅基流动 JSON 模式支持主要语言模型，并明确要求应用处理 JSON 截断和不完整等边缘情况；因此服务端仍进行白名单、数量、长度和 ID 校验。
- 当前官方价格页显示 DeepSeek-V3.2 的输入/输出价格低于 DeepSeek-V4-Pro。V4-Pro可作为困难样本复核模型，而不作为所有输入的默认模型。

## 后续评测

使用同一批人工标注企业问题，对以下候选做盲测：

1. `deepseek-ai/DeepSeek-V3.2`；
2. `deepseek-ai/DeepSeek-V4-Pro`；
3. 一个当前可用的 Qwen 中文指令模型。

指标包括信号准确率、事件 Top-3 命中率、题项 Top-6 命中率、无依据推断率、JSON 合法率、延迟和单次成本。没有该评测前，不对外宣称“最佳模型”。

## 官方资料

- [SiliconFlow 模型中心](https://www.siliconflow.cn/models)
- [SiliconFlow 价格](https://siliconflow.cn/pricing)
- [Chat Completions API](https://docs.siliconflow.cn/en/api-reference/chat-completions/chat-completions)
- [JSON 模式](https://docs.siliconflow.cn/cn/userguide/guides/json-mode)
- [隐私政策](https://api-docs.siliconflow.cn/docs/legals/privacy-policy)

