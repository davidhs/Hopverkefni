


async function main() {

    console.info("Hello world!");
}

main().catch((reason) => {
    console.error(reason);
    throw reason;
});