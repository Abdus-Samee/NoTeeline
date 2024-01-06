// import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { loadSummarizationChain } from "langchain/chains";
// import { SearchApiLoader } from "langchain/document_loaders/web/searchapi";
// import { PromptTemplate } from "langchain/prompts";
// import { TokenTextSplitter } from "langchain/text_splitter";
// Using require statements
const { OpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { loadSummarizationChain } = require("langchain/chains");
const { SearchApiLoader } = require("langchain/document_loaders/web/searchapi");
const { PromptTemplate } = require("langchain/prompts");
const { TokenTextSplitter } = require("langchain/text_splitter");

async function Langchainsummarization() {
    console.log('called inside lanchain file');

    // added dependency as shown in https://js.langchain.com/docs/get_started/installation
    // code taken from https://js.langchain.com/docs/use_cases/summarization and 
    // https://js.langchain.com/docs/modules/chains/document/refine

    const loader = new SearchApiLoader({
      apiKey: "dey5LrRJU6J97LTiCiugBPqZ",
      engine: "youtube_transcripts",
      video_id: "WTOm65IZneg",
    });

    const docs = await loader.load();

    const splitter = new TokenTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });

    const docsSummary = await splitter.splitDocuments(docs);

    const llmSummary = new OpenAI({ 
      modelName: "gpt-4-1106-preview",
      temperature: 0.3,
      maxTokens: 1000,
      maxRetries: 5,
      openAIApiKey: "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"
     });

    const summaryTemplate = `
    Your goal is to create a summary of a Youtube video. You need to highlight the main points of the video in third-person narrative.
    
    Below you find the transcript of the video:
    --------
    {text}
    --------
    SUMMARY:
    `;

    const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

    const summarizeChain = loadSummarizationChain(llmSummary, {
      type: "refine",
      verbose: true,
      summaryPrompt: SUMMARY_PROMPT
    });

    const summary = await summarizeChain.run(docsSummary);

    console.log(summary);


    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(summary); 
        }, 1000);
    });
}

module.exports = Langchainsummarization;

