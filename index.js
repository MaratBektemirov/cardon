
const ProvidersRepo = require('./classes/providers-repo');
const { readFile, writeFile, getDate, progress } = require('./utils');
const fsPromises = require('fs').promises;

const providersFile = process.argv.slice(2)[0];
const paymentsFile = process.argv.slice(2)[1];
const outputFile = process.argv.slice(2)[2];
const limit = process.argv.slice(2)[3];
const ratesFile = process.argv.slice(2)[4];
const statsFileName = process.argv.slice(2)[5];

(async () => {
    const providersRepoByCur = {};
    const providers = await readFile(providersFile);

    {
        let i = 0;
        while (i < providers.length) {
            const provider = providers[i];

            provider.CONVERSION = +provider.CONVERSION;
            provider.COMMISSION = +provider.COMMISSION;
            provider.MIN_SUM = +provider.MIN_SUM;
            provider.MAX_SUM = +provider.MAX_SUM;
            provider.ID = +provider.ID;
            provider.AVG_TIME = +provider.AVG_TIME;
            provider.LIMIT_MIN = +provider.LIMIT_MIN;
            provider.LIMIT_MAX = +provider.LIMIT_MAX;

            const cur = provider.CURRENCY;

            providersRepoByCur[cur] = providersRepoByCur[cur] || new ProvidersRepo();
            providersRepoByCur[cur].add(provider, limit);

            i++
        }
    }

    const payments = await readFile(paymentsFile);

    const statsFile = {
        totalMoneyUSD: 0,
        totalCommissionUSD: 0,
        totalTime: 0,
        totalFailed: 0,
        totalCaptured: 0,
        avgTransactionTime: 0,
        byCur: {},
    }

    {
        let i = 0;
        while (i < payments.length) {
            const payment = payments[i];
            payment.amount = +payment.amount;
            payment.date = getDate(payment.eventTimeRes);

            const providersRepo = providersRepoByCur[payment.cur];

            const s = progress();

            if (providersRepo) {
                const branch = providersRepo.getPaymentBranch(payment);
                const flow = branch.getFlow();
                payment.flow = flow.getProviders().join('-');
                const flowResult = flow.execute();

                if (flowResult.provider) {
                    providersRepo.byId[flowResult.provider].addPayment(payment);
                    statsFile.byCur[payment.cur] = statsFile.byCur[payment.cur] || {
                        money: 0,
                        commission: 0,
                        time: 0,
                        count: 0,
                        moneyUSD: 0,
                        commissionUSD: 0,
                    };

                    statsFile.byCur[payment.cur].money += payment.amount;
                    statsFile.byCur[payment.cur].commission += flowResult.commission;
                    statsFile.byCur[payment.cur].time += flowResult.time;
                    statsFile.byCur[payment.cur].count++;
                    statsFile.totalCaptured++;
                } else {
                    statsFile.totalFailed++;
                }

                statsFile.totalTime += flowResult.time;

                s.next(`Processing payments, ${i + 1} of ${payments.length}`)
            }

            i++
        }

        statsFile.avgTransactionTime = statsFile.totalTime/payments.length;
    }

    await writeFile(outputFile, [
        { id: 'eventTimeRes', title: 'eventTimeRes' },
        { id: 'amount', title: 'amount' },
        { id: 'cur', title: 'cur' },
        { id: 'payment', title: 'payment' },
        { id: 'cardToken', title: 'cardToken' },
        { id: 'flow', title: 'flow' },
    ], payments);

    const rates = await readFile(ratesFile);

    {
        const keys = Object.keys(statsFile.byCur);

        let i = 0
        while (i < keys.length) {
            const cur = keys[i];
            const rate = rates.find((r) => r.destination === cur);

            const curData = statsFile.byCur[cur];

            curData.moneyUSD = curData.money * rate.rate;
            curData.commissionUSD = curData.commission * rate.rate;

            statsFile.totalMoneyUSD += curData.moneyUSD;
            statsFile.totalCommissionUSD += curData.commissionUSD;

            i++;
        }

        readFile
    }

    await fsPromises.writeFile(
        statsFileName,
        JSON.stringify(statsFile, null, 2)
    );

    console.log(`\nOk`);
})();