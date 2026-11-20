// One shared page module selects the fruit configuration from its route prop.
// The viewer loads the selected scene factory separately in the browser.
export const loadFruitPage = () => import('../components/fruit-intelligence/FruitIntelligence');
