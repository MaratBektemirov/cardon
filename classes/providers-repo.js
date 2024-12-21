const PaymentBranch = require('./payment-branch');
const Provider = require('./provider');

class ProvidersRepo {
    byId = {};

    add(provider) {
        if (!this.byId[provider.ID]) {
            this.byId[provider.ID] = new Provider(provider.ID);
        }

        this.byId[provider.ID].addRule(provider);
    }

    getPaymentBranch(payment) {
        const paymentBranch = new PaymentBranch(payment);

        const ids = Object.keys(this.byId);

        let i = 0
        while (i < ids.length) {
            const provider = this.byId[ids[i]];
            const rule = provider.getRuleForPayment(payment);

            if (rule) {
                paymentBranch.addRule(rule);
            }

            i++;
        }

        return paymentBranch;
    }
}

module.exports = ProvidersRepo;