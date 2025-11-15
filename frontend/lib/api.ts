export async function fetchBackendHealth(){
    const response = await fetch ('https://localhost:3001/api/health');
    const data = await response.json();
    return data;
}