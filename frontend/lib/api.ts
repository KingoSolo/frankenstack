export async function fetchBackendHealth(){
    const response = await fetch ('http://localhost:3001/api/health');
    const data = await response.json();
    return data;
}