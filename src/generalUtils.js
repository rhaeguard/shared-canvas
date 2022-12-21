function generateRandomNumber() {
    return Math.ceil(Math.random() * 1000000);
}

export function generateRandomUser() {
    return {
        id: generateRandomNumber()
    }
}