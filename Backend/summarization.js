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
const { Document } = require("langchain/document");

async function Langchainsummarization(transcript) {
    console.log('called inside langchain file');
    //console.log('Transcript:')
    //console.log(transcript)

    // added dependency as shown in https://js.langchain.com/docs/get_started/installation
    // code taken from https://js.langchain.com/docs/use_cases/summarization and 
    // https://js.langchain.com/docs/modules/chains/document/refine
    
    /*
    const loader = new SearchApiLoader({
      apiKey: "dey5LrRJU6J97LTiCiugBPqZ",
      engine: "youtube_transcripts",
      video_id: "WTOm65IZneg",
    });

    const docs = await loader.load();
    */

    //const doc = new Document({ pageContent: transcript })
  
    //console.log(doc)

    const splitter = new TokenTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });

    //const docsSummary = await splitter.splitDocuments(doc);
    const docsSummary = await splitter.createDocuments([transcript]);
  
    const llmSummary = new OpenAI({ 
      modelName: "gpt-4-1106-preview",
      temperature: 0.5,
      maxTokens: 600,
      maxRetries: 5,
      openAIApiKey: "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"
     });

    const summaryTemplate = `
    Your goal is to create a summary of a Youtube video. You need to highlight the main points of the video.
    If the transcript includes first person pronouns, replace with corresponding speaker names or replace with passive voice.
    
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
    return summary;

    /*return new Promise((resolve) => {
        setTimeout(() => {
            resolve(summary); 
        }, 1000);
    });*/
}

module.exports = Langchainsummarization;

