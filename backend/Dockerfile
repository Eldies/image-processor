ARG PYTHON_VERSION=3.14

FROM python:${PYTHON_VERSION}-slim AS builder
RUN pip install --no-cache-dir poetry==2.3.2 \
    && poetry self add poetry-plugin-export \
    && poetry config virtualenvs.create false

WORKDIR /src
COPY pyproject.toml poetry.lock ./

RUN poetry export --no-interaction --output requirements.txt --without-hashes
RUN pip wheel --wheel-dir /tmp/wheelhouse -r requirements.txt

FROM python:${PYTHON_VERSION}-slim AS prod
WORKDIR /src

RUN --mount=from=builder,source=/tmp/wheelhouse,target=/mnt/wheelhouse,ro \
    pip install --no-cache-dir --no-index /mnt/wheelhouse/*

COPY ./app app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
