export const formatCurrency = (amount, currency = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (date, opts = {}) => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit', month: 'short', year: 'numeric',
        ...opts,
    }).format(new Date(date));
};

export const formatMonth = (year, month) => {
    return new Intl.DateTimeFormat('ru-RU', {
        month: 'long', year: 'numeric',
    }).format(new Date(year, month - 1));
};

export const getMonthRange = (offset = 0) => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    return {
        startDate: start.toISOString().slice(0, 10),
        endDate:   end.toISOString().slice(0, 10),
    };
};