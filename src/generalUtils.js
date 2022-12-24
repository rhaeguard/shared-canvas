function generateRandomNumber() {
    return Math.ceil(Math.random() * 1000000);
}

export function generateRandomUser() {
    const existingUserStr = localStorage?.getItem("USER");
    
    if (existingUserStr) {
        return JSON.parse(existingUserStr);
    }

    const newUser = {
        id: generateRandomNumber()
    }

    localStorage?.setItem("USER", JSON.stringify(newUser));

    return newUser;
}