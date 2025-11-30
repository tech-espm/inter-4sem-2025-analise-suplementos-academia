import banco
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

def categorias():
    driver.get('https://www.gsuplementos.com.br/')
    spans = driver.find_elements(By.CSS_SELECTOR, "span[data-v-9e4060be]")
    span_textos = []
    
    for span in spans:
        nome = span.get_attribute("innerText").strip()
        if nome and nome not in span_textos:
            span_textos.append(nome)

    for i in range(8):
        banco.inserirCategoria(span_textos[i])
