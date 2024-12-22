# Установка Node.js и npm
Установка Node.js (не ниже чем v22.8.0) и npm (не ниже чем 10.8.2) https://nodejs.org/en/download/package-manager  
# Установка всех npm-пакетов  
После установки Node.js и npm нужно выполнить команду: npm install
# Запуск
node index.js файл_провайдеров.csv файл_платежей.csv выходной_файл.csv тип_лимита (day-limit или no-limit) котировки.csv выходной_файл_статистики.json  
Например:  
node index.js providers.csv payments.csv output.csv day-limit rates.csv stats.json (учитываем дневной лимит провайдера)  
node index.js providers.csv payments.csv output.csv no-limit rates.csv stats.json (не учитываем дневной лимит провайдера)
