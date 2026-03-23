export function mapPokemonToUI(apiData) {
    return {
        // ... (mantenha as outras propriedades iguais)
        name: apiData.name.toUpperCase(),
        id: `#${apiData.id.toString().padStart(3, '0')}`,
        imageUrl: apiData.sprites.front_default,
        // 👇 A MÁGICA ACONTECE AQUI 👇
        typesHtml: apiData.types
            .map(t => {
            const typeName = t.type.name.toLowerCase();
            // Adicionamos a classe type-${typeName} dinamicamente
            return `<span class="type-badge type-${typeName}">${typeName}</span>`;
        })
            .join(""),
        heightText: `${apiData.height / 10}m`,
        weightText: `${apiData.weight / 10}kg`,
        statsHtml: apiData.stats
            .map(s => `
                <div class="stat-row">
                    <span class="stat-name">${s.stat.name}</span>
                    <span class="stat-value">${s.base_stat}</span>
                </div>
            `).join("")
    };
}
