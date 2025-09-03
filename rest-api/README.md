# For python fastapi setup:

Using uv package manager + cpython interpreter 3.13 on my device (for context)

```
uv venv # or python3 -m venv .venv
source .venv/bin/activate  # on macos/linux or .\venv\Scripts\activate on Windows (not so sure abt this)
uv pip install -r requirements.txt # or just pip install ...
```

To run backend locally:

```
uv run fastapi dev # from inside rest-api

# if not using uv:
fastapi dev app/main.py # not sure again need to try
```
