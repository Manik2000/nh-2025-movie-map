import json
from time import sleep

import numpy as np
import umap
from dotenv import load_dotenv
from google import genai
from tqdm import tqdm


def embed_text(client: genai.Client, texts: list[str]) -> list[float]:
    embeddings_response = client.models.embed_content(
        model="gemini-embedding-exp-03-07",
        contents=texts,
    )
    return embeddings_response.embeddings


def batch_embed_text(
    client: genai.Client, texts: list[str], batch_size: int = 10
) -> list[float]:
    embeddings = []
    for i in tqdm(range(0, len(texts), batch_size)):
        batch = texts[i : i + batch_size]
        embeddings.extend(embed_text(client=client, texts=batch))
        sleep(20)
    return embeddings


def main():
    load_dotenv()
    client = genai.Client()

    raw_movie_details = json.load(open("data/raw_movie_details.json"))

    embeddings = batch_embed_text(
        client=client, texts=[movie["description"] for movie in raw_movie_details]
    )
    embeddings_arrays = [embedding.values for embedding in embeddings]

    with open("data/embeddings.json", "w") as f:
        json.dump(embeddings_arrays, f)

    one_array = np.array(embeddings_arrays)
    reducer = umap.UMAP(
        n_components=2,
        metric="cosine",
        n_neighbors=20,
        random_state=42,
        repulsion_strength=2,
        spread=2,
    )
    umap_embeddings = reducer.fit_transform(one_array)

    with open("data/umap_embeddings.json", "w") as f:
        json.dump(umap_embeddings.tolist(), f)

    full_movie_details = [
        {
            **movie,
            "x": float(umap_embeddings[i][0]),
            "y": float(umap_embeddings[i][1]),
        }
        for i, movie in enumerate(raw_movie_details)
    ]

    with open("data/full_movie_details.json", "w") as f:
        json.dump(full_movie_details, f)


if __name__ == "__main__":
    main()
