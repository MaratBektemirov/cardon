
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

            const cur = provider.CURRENCY;
    
            providersRepoByCur[cur] = providersRepoByCur[cur] || new ProvidersRepo();
            providersRepoByCur[cur].add(provider);
    
            i++
        }
    }

    const payments = await readFile(paymentsFile);

    {
        let i = 0;
        while (i < payments.length) {
            const payment = payments[i];

            const providersRepo = providersRepoByCur[payment.cur];

            if (providersRepo) {
                const branch = providersRepo.getPaymentBranch(payment);
                payment.flow = [];
    
                const flow = branch.getFlow();
    
                let j = 0
                while (j < flow.isValid.length) {
                    if (flow.isValid[j]) {
                        payment.flow.push(flow.id[j]);
                    }
    
                    j++
                }
    
                payment.flow = payment.flow.join('-')
            }
    
            i++
        }
    }

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