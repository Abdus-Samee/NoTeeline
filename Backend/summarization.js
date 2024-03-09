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
      chunkSize: 50000,
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
    Do not mention words such as 'the speaker', 'this video', 'the transcript, 'the text' etc. 
    Do not use first person pronouns. 
    Just write the main points in short sentences. The summary should not be more than 5 sentences.
    Below you find the transcript of the video:
    --------
    {text}
    --------
    Follow these rules:
    1. Do not mention generic words such as 'the speaker', 'this video', 'the transcript, 'the text' etc. 
    2. Do not use first person pronouns. 
    3. Just write the main points in short and simple sentences. 
    4. The summary should not be more than 5 sentences.
    5. Write it in a way you would describe to a friend. Do not use sentences such as 'This video talks about...', 'The speaker explains..' etc.
    SUMMARY:
    `;

    // If the transcript includes first person pronouns, replace with corresponding speaker names or replace with passive voice.

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

