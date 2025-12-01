import banco
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 20)

def categorias():
    driver.get('https://www.gsuplementos.com.br/')
    
    spans = driver.find_elements(
    By.XPATH, "//ul[contains(@class,'subMenuFull')]/li/div//a/span"
    )
    
    span_textos = []
    
    for span in spans:
        nome = span.get_attribute("innerText").strip()
        if nome and nome not in span_textos:
            span_textos.append(nome)

    for i in range(8):
        banco.inserirCategoria(span_textos[i])

def formatos():
    formatos = ["Pó", "Bebida", "Alimento", "Cápsula", "Comprimido"]
    for formato in formatos:
        banco.inserirFormato(formato)
    return formatos

def obter_preco_original():
    try:
        container = wait.until(
            EC.presence_of_element_located((
                By.XPATH, "//div[(contains(@class,'topo') or contains(@class,'box')) and (contains(@class,'direito') or contains(@class,'Right') or contains(@class,'right'))]"
            ))
        )

        spans = container.find_elements(By.XPATH, ".//span[contains(.,'R$')]")

        valores = []

        for span in spans:
            txt = span.get_attribute("innerText").replace("R$", "").replace(".", "").replace(",", ".").strip()
            try:
                valores.append(float(txt))
            except:
                pass

        if not valores:
            return 0

        return max(valores)

    except:
        return 0

def obter_porcentagem(e):
    style = e.get_attribute("style")
    if "width:" not in style:
        return 0
    return float(style.split("width:")[1].split("%")[0].strip())

def obter_estrelas(estrelas, total):
    porcentagens = [obter_porcentagem(e) for e in estrelas]
    valores = [round(total * p / 100) for p in porcentagens]
    
    diff = total - sum(valores)
    if diff > 0:
        while sum(valores) != total:
            maior = valores.index(max(valores))
            valores[maior] += 1
    elif diff < 0:
        while sum(valores) != total:
            maior = valores.index(max(valores))
            valores[maior] -= 1
    
    return valores

def obter_links_categoria(url):
    page = 1
    links = []

    while True:
        driver.get(f"{url}?pg={page}")
        produtos = driver.find_elements(By.CSS_SELECTOR, "a.card__name")

        if not produtos:
            break

        for p in produtos:
            href = p.get_attribute("href")
            if href not in links:
                links.append(href)

        page += 1

    return links

def detectar_formato(driver):
    try:
        spans = driver.find_elements((By.CSS_SELECTOR, "th.table-header span"))

        if len(spans) < 2:
                return None

        conteudo = spans[1].text.strip().lower()

        if not conteudo:
            return None

        palavras_capsulas = ["cápsula", "capsula", "cápsulas", "capsulas", "caps", "caps.", "capsule", "capsules"]
        palavras_comprimidos = ["comprimido", "comprimidos", "comp.", "comp "]
        palavras_po = ["dosador", "dosadores", "scoop", "medidor"]
        
        if any(p in conteudo for p in palavras_capsulas):
            return "Cápsula"

        if any(p in conteudo for p in palavras_comprimidos):
            return "Comprimido"

        if " ml" in conteudo or "ml " in conteudo or "ml)" in conteudo:
            return "Bebida"

        if any(p in conteudo for p in palavras_po):
            return "Pó"
        
        if " g" in conteudo or "g " in conteudo:
            return "Alimento"

        return None
    
    except Exception as e:
        # print("Erro ao detectar formato:", e)
        return None

def produtos(formatos):
    driver.get('https://www.gsuplementos.com.br/')

    categorias = [c.get_attribute("href") for c in 
                  driver.find_elements(
                    By.XPATH, "//ul[contains(@class,'subMenuFull')]/li/div//a"
                    )]
    
    visitados = set()
    lista_produtos = []

    for i in range(8):
        todos_links = obter_links_categoria(categorias[i])
        
        for href in todos_links:
            
            if href in visitados:
                continue
            
            visitados.add(href)
            
            driver.get(href)

            nome = wait.until(
                EC.presence_of_element_located((
                    By.XPATH, "//div[(contains(@class,'topo') or contains(@class,'box')) and (contains(@class,'direito') or contains(@class,'Right') or contains(@class,'right'))]/h1[(contains(@class, 'nome') or contains(@class, 'Nome') or contains(@class, 'titulo'))]"
                    ))
            ).text.strip()

            preco = obter_preco_original()

            try:
                avals = int(
                    driver.find_element(By.XPATH, "//div[contains(@class,'ts-rating-title')]/p")
                    .text.replace("(","").replace(")","")
                )
            except:
                print("Avals não obtidos.")
                avals = 0

            if avals != 0:
                estrelas = driver.find_elements(By.CSS_SELECTOR, "div.ts-fill")

            try:
                e5, e4, e3, e2, e1 = obter_estrelas(estrelas, avals)
            except:
                e5, e4, e3, e2, e1 = 0, 0, 0, 0, 0
                print(avals)
                print(nome, "deu ruim estrelas")
            
            try:
                emedia = float(
                    driver.find_element(By.CSS_SELECTOR, "span.ts-v-rating-note_value")
                    .text.strip()
                )
            except:
                try:
                    emedia = (e5 + e4 + e3 + e2 + e1) / 5
                except:
                    emedia = 0
            
            try:
                recom = int(
                    driver.find_element(By.CSS_SELECTOR, "span.ts-v-percentage-label")
                    .get_attribute("innerText").replace("%", "").strip()
                )
            except:
                recom = 0
                print("Recomendações não encontradas.")
            
            formato_texto = detectar_formato(driver)
            
            if formato_texto:
                formato = formatos.index(formato_texto) + 1
            else:
                formato = 1

            lista_produtos.append({
                "nome": str(nome),
                "preco": float(preco),
                "e5": int(e5),
                "e4": int(e4),
                "e3": int(e3),
                "e2": int(e2),
                "e1": int(e1),
                "emedia": float(emedia),
                "avals": int(avals),
                "recom": int(recom),
                "id_form": int(formato)
            })
            
    for produto in lista_produtos:
        banco.inserirProduto(produto["nome"], produto["preco"], produto["e5"], produto["e4"], produto["e3"], produto["e2"], produto["e1"], produto["emedia"], produto["avals"], produto["recom"], produto["id_form"])

categorias()
lformatos = formatos()
produtos(lformatos)