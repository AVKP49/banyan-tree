import asyncio, edge_tts

async def test():
    voices = [
        ('en-US-AvaMultilingualNeural', '-15%', '-2Hz', 'ava'),
        ('en-IN-NeerjaExpressiveNeural', '-18%', '-3Hz', 'neerja'),
        ('en-US-JennyMultilingualNeural', '-12%', '+0Hz', 'jenny'),
    ]
    text = 'Come, beta, sit with me. Do you see that big tree over there? In my village, we had a tree just like that, a great banyan tree, so old that even my dadi did not know when it was planted.'
    for v, r, p, name in voices:
        c = edge_tts.Communicate(text, v, rate=r, pitch=p)
        await c.save(f'/tmp/{name}.mp3')
        print(f'Saved /tmp/{name}.mp3')

asyncio.run(test())
