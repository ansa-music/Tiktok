function loadModule(key) {
    const content = document.getElementById('content');
    const data = CISCO_DB[key];

    if (key === 'home') {
        location.reload(); return;
    }

    if (data) {
        content.innerHTML = `
            <div class="card">
                <h2>${data.title}</h2>
                <ul>${data.steps.map(s => `<li>${s}</li>`).join('')}</ul>
                <div class="code-block">
                    <pre>${data.code}</pre>
                </div>
            </div>
        `;
    }
}

// Часы как в 2027
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

// Внутри функции loadModule, перед списком шагов:
content.innerHTML = `
    <div class="card">
        <img src="images/${key}.png" style="width:100%; border-radius:10px; margin-bottom:15px;" onerror="this.style.display='none'">
        <h2>${data.title}</h2>
        ...
`;
