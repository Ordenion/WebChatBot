from openai import AsyncOpenAI
import aiofiles
import logging

client = AsyncOpenAI(api_key="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")

# Словарь для хранения контекста пользователей
user_contexts = {}

def update_user_context(user_id, message):
    """Обновление контекста пользователя."""
    if user_id not in user_contexts:
        user_contexts[user_id] = []
    user_contexts[user_id].append({"role": "user", "content": message})
    if len(user_contexts[user_id]) > 20:  # Ограничение на 20 сообщений
        user_contexts[user_id] = user_contexts[user_id][-20:]

def get_user_context_messages(user_id):
    """Формирование сообщений для модели на основе контекста пользователя."""
    return user_contexts.get(user_id, [])

async def generate_response(user_id: int, user_input: str, prompt_file: str) -> str:
    """Генерация ответа с использованием модели GPT-4."""
    async with aiofiles.open(prompt_file, 'r', encoding='utf-8') as f:
        prompt_text = await f.read()
    
    context_messages = get_user_context_messages(user_id)
    messages = [{"role": "system", "content": prompt_text}] + context_messages + [{"role": "user", "content": user_input}]

    logging.info(f"Messages sent to model: {messages}")

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=400,
            temperature=0.2,
            n=1,
            stop=["\nuser:"]
        )
    except Exception as e:
        logging.error(f"Error generating response: {e}")
        return "Произошла ошибка при генерации ответа. Пожалуйста, попробуйте снова позже."

    response_text = response.choices[0].message.content.strip()
    logging.info(f"Model response: {response_text}")

    # Обновление контекста пользователя с ответом модели
    user_contexts[user_id].append({"role": "assistant", "content": response_text})

    return response_text
