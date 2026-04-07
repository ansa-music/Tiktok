// Добавь это в объект CISCO_DB
lab12: {
    title: "№12 Зертханалық жұмыс: OSPF",
    subtitle: "Динамикалық маршруттау (OSPF протоколы)",
    steps: [
        [span_3](start_span)"1. Собери топологию: 3 роутера 2911 и 3 PC[span_3](end_span).",
        "2. [span_4](start_span)[span_5](start_span)Соедини Router2(Gi0/0) с Router1(Gi0/0) и Router2(Gi0/1) с Router3(Gi0/1)[span_4](end_span)[span_5](end_span).",
        "3. [span_6](start_span)[span_7](start_span)Настрой IP-адреса на всех интерфейсах согласно схеме[span_6](end_span)[span_7](end_span).",
        "4. [span_8](start_span)Включи OSPF на Router2: укажи сети 10.10.10.0/30, 10.10.11.0/30 и 192.168.1.0/24[span_8](end_span).",
        "5. [span_9](start_span)Проверь связность командой 'show ip ospf neighbor'[span_9](end_span)."
    ],
    code: "! Настройка Router2\nenable\nconf t\nrouter ospf 1\n network 192.168.1.0 0.0.0.255 area 0\n network 10.10.10.0 0.0.0.3 area 0\n network 10.10.11.0 0.0.0.3 area 0\nexit"
}
