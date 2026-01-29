<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header&animation=fadeIn" />
</div>

<h1 align="center">🛍️ TodoTechShop - Frontend</h1>

<h3 align="center">🎯 Sistema E-commerce Multirol para venta de tecnología</h3>

<p align="center">
  Aplicación Angular con múltiples interfaces para clientes, vendedores, cajeros y despachadores.<br>
  Gestión completa del ciclo de venta: asesoría, carrito, pagos y seguimiento.
</p>

---

## 📋 **Descripción del Proyecto**

**TodoTechShop Frontend** es una aplicación web desarrollada en Angular que implementa un sistema de comercio electrónico con **cuatro roles diferenciados**. La plataforma permite una experiencia de compra completa, desde la exploración del catálogo hasta la gestión de órdenes y despachos, con interfaces específicas para cada tipo de usuario.

---

## 👥 **Sistema Multirol**

### **🎨 Cliente**
- **Explorar catálogo** de productos tecnológicos
- **Carrito de compras** persistente
- **Proceso de checkout** con múltiples métodos de pago
- **Seguimiento de pedidos** en tiempo real
- **Historial de compras** personalizado

### **💼 Vendedor**
- **Asesoría virtual y presencial** a clientes
- **Gestión de órdenes de venta** asistidas
- **Catálogo extendido** con detalles técnicos
- **Seguimiento de clientes** y ventas
- **Reportes de ventas** por período

### **💰 Cajero**
- **Procesamiento de pagos** en local
- **Gestión de transacciones** en efectivo/tarjeta
- **Facturación electrónica** integrada
- **Cierre de caja** automático
- **Conciliación bancaria**

### **🚚 Despachador**
- **Gestión de envíos** y logística
- **Actualización de estados** de despacho
- **Generación de guías** de transporte
- **Seguimiento GPS** de pedidos
- **Confirmación de entrega**

---


---

## 🔧 **Stack Tecnológico**

### **Frontend Framework**
<div align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/RxJS-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" />
</div>

### **UI/UX & Estilos**
<div align="center">
  <img src="https://img.shields.io/badge/Angular_Material-007ACC?style=for-the-badge&logo=angular&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</div>

### **Estado & Comunicación**
<div align="center">
  <img src="https://img.shields.io/badge/NGXS-4DBA87?style=for-the-badge&logo=angular&logoColor=white" />
  <img width="8" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />
</div>

---

## 🧩 **Módulos Principales**

### **🛒 Módulo de Cliente**
- **Home:** Catálogo destacado y ofertas
- **Productos:** Búsqueda, filtros y detalles
- **Carrito:** Gestión de items y cantidades
- **Checkout:** Dirección, envío y pago
- **Mis Pedidos:** Historial y seguimiento

### **👔 Módulo de Vendedor**
- **Dashboard:** Métricas de ventas
- **Clientes:** Gestión y seguimiento
- **Órdenes:** Asesoría y gestión activa
- **Productos:** Catálogo con stock
- **Reportes:** Análisis de ventas

### **🏦 Módulo de Cajero**
- **Punto de Venta:** Interfaz POS
- **Transacciones:** Procesamiento en tiempo real
- **Facturación:** Generación de comprobantes
- **Cierre Diario:** Conciliación y reportes

### **📦 Módulo de Despachador**
- **Órdenes Pendientes:** Lista para despacho
- **Gestión de Envíos:** Asignación de transportista
- **Seguimiento:** Actualización de estados
- **Confirmaciones:** Entregas realizadas

---


🚀 CI/CD Pipeline
⚙️ Configuración de GitHub Actions
El proyecto implementa una pipeline de entrega continua que asegura calidad y despliegue automático.

name: CI/CD TodoTech Frontend

on:
  push:
    branches: [ firebase ]
  pull_request:
    branches: [ firebase ]

jobs:
  # ------------------------------
  # PRUEBAS UNITARIAS
  # ------------------------------
  test:
    name: ✅ Ejecutar Pruebas
    runs-on: ubuntu-latest
    
    steps:
      - name: ⬇️ Obtener código del repositorio
        uses: actions/checkout@v4

      - name: ⎔ Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Instalar dependencias
        run: npm ci

      - name: 🧪 Ejecutar pruebas unitarias
        run: npm test -- --watch=false --browsers=ChromeHeadless --code-coverage

  # ------------------------------
  # DESPLIEGUE A FIREBASE
  # ------------------------------
  deploy:
    name: 🚀 Desplegar a Firebase
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/firebase'

    steps:
      - name: ⬇️ Obtener código del repositorio
        uses: actions/checkout@v4

      - name: ⎔ Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Instalar dependencias
        run: npm ci

      - name: 🏗️ Construir aplicación Angular
        run: npm run build -- --configuration production

      - name: 🔥 Desplegar a Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: 'todotechshopfrontend'
          channelId: live
          entryPoint: './'

---

📊 Flujo de CI/CD
<div align="center"> <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" /> <img width="8" /> <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" /> <img width="8" /> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> </div>



👨‍💻 Desarrollador
<div align="center">
Santiago Arbelaez Contreras

Junior Full Stack Developer

Estudiante de Ingeniería de Sistemas – Universidad del Quindío

<br> <a href="https://github.com/santiagoarbelaezc"> <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" /> </a> <img width="10" /> <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/"> <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" /> </a> <img width="10" /> <a href="https://portfolio-santiagoa.web.app/portfolio"> <img src="https://img.shields.io/badge/Portfolio-6C63FF?style=for-the-badge&logo=sparkles&logoColor=white" /> </a></div><div align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=90&section=footer&animation=fadeIn" /> </div>
