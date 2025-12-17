import json
from datetime import datetime

LOG_FILE = "token_usage_log.jsonl"

def log_token_usage(
    *,
    model: str,
    user_text: str,
    response_text: str,
    input_tokens: int,
    output_tokens: int,
    total_tokens: int,
):
    record = {
        "timestamp": datetime.utcnow().isoformat(),
        "model": model,
        "user_text": user_text,
        "response_text": response_text,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
    }

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
