
const ProvidersRepo = require('./classes/providers-repo');
const { readFile, writeFile } = require('./utils');

const providersFile = process.argv.slice(2)[0];
const paymentsFile = process.argv.slice(2)[1];
const outputFile = process.argv.slice(2)[2];

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

            const cur = provider.CURRENCY;
    
            providersRepoByCur[cur] = providersRepoByCur[cur] || new ProvidersRepo();
            providersRepoByCur[cur].add(provider);
    
            i++
        }
    }

    const payments = await readFile(paymentsFile);

    let totalTime = 0;
    let totalCommission = 0;
    let statsByCur = {};
    let failed = 0;
    let captured = 0;

    {
        let i = 0;
        while (i < payments.length) {
            const payment = payments[i];
            payment.amount = +payment.amount;

            const providersRepo = providersRepoByCur[payment.cur];

            if (providersRepo) {
                const branch = providersRepo.getPaymentBranch(payment);
                const flow = branch.getFlow();
                payment.flow = flow.getProviders().join('-');
                const flowResult = flow.execute();

                if (flowResult.provider) {
                    totalCommission += flowResult.commission;
                    providersRepo.byId[flowResult.provider].addPayment(payment);
                    statsByCur[payment.cur] = statsByCur[payment.cur] || {money: 0, commission: 0, time: 0, count: 0};
                    statsByCur[payment.cur].money += payment.amount;
                    statsByCur[payment.cur].commission += flowResult.commission;
                    statsByCur[payment.cur].time += flowResult.time;
                    statsByCur[payment.cur].count++;
                    captured++;
                } else {
                    failed++;
                }

                totalTime += flowResult.time;
            }
    
            i++
        }
    }

    console.log(`All money: ${JSON.stringify(statsByCur, null, 2)}, total time: ${totalTime}, captured: ${captured}, failed: ${failed}`);

    await writeFile(outputFile, [
        { id: 'eventTimeRes', title: 'eventTimeRes' },
        { id: 'amount', title: 'amount' },
        { id: 'cur', title: 'cur' },
        { id: 'payment', title: 'payment' },
        { id: 'cardToken', title: 'cardToken' },
        { id: 'flow', title: 'flow' },
    ], payments);

    console.log(`${outputFile} has been created`);
})();