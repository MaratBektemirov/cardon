const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const providersByCur = {};

const providersFile = process.argv.slice(2)[0];
const paymentsFile = process.argv.slice(2)[1];
const outputFile = process.argv.slice(2)[2];

class PaymentBranch {
    byCommision = {};

    constructor() {
    }

    checkRule(rule, payment) {
        return payment.amount >= rule.MIN_SUM && payment.amount <= rule.MAX_SUM;
    }

    addRule(rule, payment) {
        this.byCommision[rule.COMMISSION] = this.byCommision[rule.COMMISSION] || [];
        this.byCommision[rule.COMMISSION].push(Object.assign({ isValid: this.checkRule(rule, payment) }, rule));
        this.byCommision[rule.COMMISSION].sort((a, b) => b.CONVERSION - a.CONVERSION);
    }

    getFlow() {
        const result = {
            minMax: [],
            commision: [],
            conversion: [],
            isValid: [],
            id: [],
            time: [],
            cur: [],
        };

        const keys = Object.keys(this.byCommision).map((v) => +v).sort((a, b) => a - b);

        let i = 0
        while (i < keys.length) {
            const c = keys[i];

            let j = 0;
            while (j < this.byCommision[c].length) {
                result.minMax.push([this.byCommision[c][j].MIN_SUM, this.byCommision[c][j].MAX_SUM]);
                result.commision.push(this.byCommision[c][j].COMMISSION);
                result.conversion.push(this.byCommision[c][j].CONVERSION);
                result.isValid.push(this.byCommision[c][j].isValid)
                result.id.push(this.byCommision[c][j].ID);
                result.time.push(this.byCommision[c][j].TIME)
                result.cur.push(this.byCommision[c][j].CURRENCY)
                j++;
            }

            i++
        }

        return result;
    }
}

class Provider {
    id;
    rules = [];

    getRuleForPayment(payment) {
        const eventTimeRes = new Date(payment.eventTimeRes).getTime();

        let i = this.rules.length - 1;
        while (i >= 0) {
            const ruleTime = new Date(this.rules[i].TIME).getTime();

            if (eventTimeRes >= ruleTime) {
                return this.rules[i];
            }

            i--;
        }

        return null;
    }

    addRule(provider) {
        this.rules.push(provider);
        this.rules.sort((a, b) => new Date(b.TIME).getTime() - new Date(a.TIME).getTime());
    }

    constructor(id) {
        this.id = id;
    }
}

class ProvidersRepo {
    maxSum = 0;
    minSum = Infinity;

    byId = {};
    length = 0;

    add(provider) {
        provider.CONVERSION = +provider.CONVERSION;
        provider.COMMISSION = +provider.COMMISSION;
        provider.MIN_SUM = +provider.MIN_SUM;
        provider.MAX_SUM = +provider.MAX_SUM;
        provider.ID = +provider.ID;

        if (!this.byId[provider.ID]) {
            this.byId[provider.ID] = new Provider(provider.ID);
            this.length++;
        }

        this.byId[provider.ID].addRule(provider);

        if (provider.MAX_SUM > this.maxSum) {
            this.maxSum = provider.MAX_SUM;
        }

        if (provider.MIN_SUM < this.minSum) {
            this.minSum = provider.MIN_SUM;
        }
    }

    getPaymentBranch(payment) {
        const paymentBranch = new PaymentBranch();

        const ids = Object.keys(this.byId);

        let i = 0
        while (i < ids.length) {
            const provider = this.byId[ids[i]];
            const rule = provider.getRuleForPayment(payment);

            if (rule) {
                paymentBranch.addRule(rule, payment);
            }

            i++;
        }

        return paymentBranch;
    }
}

const providers = [];

fs.createReadStream(providersFile)
    .pipe(csv())
    .on('data', (data) => providers.push(data))
    .on('end', () => {
        let i = 0;
        while (i < providers.length) {
            providersByCur[providers[i].CURRENCY] = providersByCur[providers[i].CURRENCY] || new ProvidersRepo();
            providersByCur[providers[i].CURRENCY].add(providers[i]);

            i++
        }

        const payments = [];

        fs.createReadStream(paymentsFile)
            .pipe(csv())
            .on('data', (data) => payments.push(data))
            .on('end', () => {
                const debug = [];

                let i = 0;
                while (i < payments.length) {
                    if (providersByCur[payments[i].cur]) {
                        const branch = providersByCur[payments[i].cur].getPaymentBranch(payments[i]);
                        payments[i].flow = [];

                        const flow = branch.getFlow();

                        let j = 0
                        while (j < flow.isValid.length) {
                            if (flow.isValid[j]) {
                                payments[i].flow.push(flow.id[j]);
                            }

                            j++
                        }

                        payments[i].flow = payments[i].flow.join('-')

                        debug.push([flow, payments[i].eventTimeRes, payments[i].cur, payments[i].amount])
                    }

                    i++
                }

                const csvWriter = createCsvWriter({
                    path: outputFile,
                    header: [
                        { id: 'eventTimeRes', title: 'eventTimeRes' },
                        { id: 'amount', title: 'amount' },
                        { id: 'cur', title: 'cur' },
                        { id: 'payment', title: 'payment' },
                        { id: 'cardToken', title: 'cardToken' },
                        { id: 'flow', title: 'flow' },
                    ]
                });

                csvWriter.writeRecords(payments)
                    .then(() => {
                        console.log('...Done');
                        //fs.writeFileSync("debug.json", JSON.stringify(debug, null, 2));
                    });
            });
    });