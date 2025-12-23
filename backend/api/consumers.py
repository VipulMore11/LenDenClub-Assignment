import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer


class TransactionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query = parse_qs(self.scope["query_string"].decode())
        user_id = query.get("user_id", [None])[0]

        if not user_id:
            await self.close()
            return

        self.group_name = f"user_{user_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()
        print("WS CONNECTED FOR USER", user_id)

    async def disconnect(self, close_code):
        print("WS DISCONNECTED", close_code)
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def transaction_event(self, event):
        await self.send(text_data=json.dumps(event))
