import os
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

class Output(BaseModel):
    summary: str = Field(description="The summarized and translated text.")

class LLMService:
    def __init__(self):
        # Aqui assumimos que há uma variável de ambiente HF_TOKEN configurada.
        self.llm = OpenAI(
            temperature=0.5,
            top_p=0.7,
            api_key=os.getenv("HF_TOKEN"),  # type: ignore
            base_url="https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1",
        )

        parser = JsonOutputParser(pydantic_object=Output)

        # seria também interessante fazer duas chamadas a llm pra resumir e depois
        # traduzir, mas llms já são bem capazes de fazer isso em uma tacada só.
        prompt = PromptTemplate(template="summarize the text: '{text}'\n" +
                                "then translate it to: '{lang}'.\n" +
                                "{format_instructions}.",
                                input_variables=["text", "lang"],
                                partial_variables={"format_instructions": parser.get_format_instructions()})
        
        self.chain = prompt | self.llm | parser

    def summarize_text(self, text: str, lang: str) -> str:
        response = self.chain.invoke({"text": text, "lang": lang})
        return response["summary"] # output é um dict
