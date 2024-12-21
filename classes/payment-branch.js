const PaymentFlow = require('./payment-flow');

class PaymentBranch {
    payment = null;
    byCommission = {};

    constructor(payment) {
        this.payment = payment;
    }

    checkRule(rule) {
        return this.payment.amount >= rule.MIN_SUM && this.payment.amount <= rule.MAX_SUM;
    }

    addRule(rule) {
        this.byCommission[rule.COMMISSION] = this.byCommission[rule.COMMISSION] || {};
        this.byCommission[rule.COMMISSION][rule.CONVERSION] = this.byCommission[rule.COMMISSION][rule.CONVERSION] || [];
        this.byCommission[rule.COMMISSION][rule.CONVERSION].push(Object.assign({ isOk: this.checkRule(rule) }, rule));
        this.byCommission[rule.COMMISSION][rule.CONVERSION].sort((a, b) => a.AVG_TIME - b.AVG_TIME);
    }

    getFlow() {
        const flow = new PaymentFlow(this.payment.amount);

        const byCommissionKeys = Object.keys(this.byCommission).map((v) => +v).sort((a, b) => a - b);

        let i = 0
        while (i < byCommissionKeys.length) {
            const commission = byCommissionKeys[i];

            const byConversion = this.byCommission[commission];
            const byConversionKeys = Object.keys(byConversion).map((v) => +v).sort((a, b) => b - a);

            let j = 0;
            while (j < byConversionKeys.length) {
                const conversion = byConversionKeys[j];

                let k = 0;
                while (k < byConversion[conversion].length) {
                    const provider = byConversion[conversion][k];
                    
                    flow.conversion.push(provider.CONVERSION);
                    flow.time.push(provider.AVG_TIME);
                    flow.commission.push(provider.COMMISSION);
                    flow.isOk.push(provider.isOk)
                    flow.id.push(provider.ID);

                    k++;
                }

                j++;
            }

            i++
        }

        return flow;
    }
}

module.exports = PaymentBranch;