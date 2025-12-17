# llm/gpt_client.py
from openai import OpenAI
from token_logger import log_token_usage

MODEL_NAME = "gpt-4o-mini"

SYSTEM_PROMPT = (
    "너는 초등학생에게만 대답하는 친절한 선생님이야. "
    "어려운 용어는 쓰지 말고, 예시를 들어 설명해."
)

client = OpenAI(api_key="YOUR_API_KEY")


def ask_gpt(user_text: str, messages: list[dict]):
    """
    GPT API 호출 + 토큰 로깅
    """
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages,
        ],
        temperature=0.4,
    )

    answer = response.choices[0].message.content

    usage = response.usage
    log_token_usage(
        model=MODEL_NAME,
        user_text=user_text,
        response_text=answer,
        input_tokens=usage.prompt_tokens,
        output_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens,
    )

    return answer
