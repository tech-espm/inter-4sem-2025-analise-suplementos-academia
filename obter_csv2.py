import banco
import pandas as pd
from unidecode import unidecode

def gerarCsv2():
    produtos = banco.listarProdutos()
    df = pd.DataFrame(produtos)
    df = df.drop("id", axis=1)

    dummies = df["categorias"].str.replace(" ", "").str.lower().apply(unidecode).str.get_dummies(sep=",")
    df = pd.concat([df.drop("categorias", axis=1), dummies], axis=1)

    df.to_csv("produtos.csv", index=False, encoding="utf-8-sig", sep=";", quoting=1, decimal=",")

banco.inserirValoresPerdidos()
gerarCsv2()