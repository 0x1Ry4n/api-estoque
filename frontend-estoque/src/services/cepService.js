export const CepService = {
    getAddress: async (cep) => 
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
}