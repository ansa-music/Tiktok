const CISCO_DB = {
    basics: {
        title: "Базовая настройка роутера",
        steps: [
            "Подключите консольный кабель к PC и Router",
            "Откройте вкладку Desktop -> Terminal в Packet Tracer",
            "Введите следующие команды:"
        ],
        code: "enable\nconf t\nhostname R1\nno ip domain-lookup"
    },
    vlan: {
        title: "Настройка VLAN (Виртуальные сети)",
        steps: [
            "Зайдите в Switch",
            "Создайте номер VLAN",
            "Назначьте порты в этот VLAN"
        ],
        code: "vlan 10\nname STAFF\nexit\nint range fa0/1-10\nswitchport mode access\nswitchport access vlan 10"
    }
};
