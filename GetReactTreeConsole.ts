function getReactData(el) {
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
    if (!el[key]) return "Aucune donnée React trouvée sur cet élément spécifique.";
    
    // On remonte les parents jusqu'à trouver un composant avec un nom lisible
    let fiber = el[key];
    while (fiber) {
        const name = fiber.type?.displayName || fiber.type?.name;
        if (name && typeof fiber.type !== 'string') {
            return {
                componentName: name,
                props: fiber.memoizedProps,
                fiber: fiber
            };
        }
        fiber = fiber.return;
    }
}

console.log(getReactData($0));