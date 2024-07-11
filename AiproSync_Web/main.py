from fastapi import FastAPI, Request, HTTPException
import aiofiles
import logging
from app.chatbot import update_user_context, generate_response

app = FastAPI()

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_input = data.get('message')
    user_id = data.get('user_id', 'default_user_id')
    if not user_input or not user_id:
        raise HTTPException(status_code=400, detail="No message or user ID provided")

    try:
        update_user_context(user_id, user_input)
        response = await generate_response(user_id, user_input, "app/prompt.txt")
    except Exception as e:
        logging.error(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

    try:
        async with aiofiles.open("conversations.txt", "a") as f:
            await f.write(f"User: {user_input}\nBot: {response}\n\n")
    except Exception as e:
        logging.error(f"Error writing to file: {e}")
        raise HTTPException(status_code=500, detail="Error writing to file")

    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8081, reload=True)
