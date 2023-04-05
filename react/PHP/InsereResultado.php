<?php
header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST');

header("Access-Control-Allow-Headers: X-Requested-With");

$nome = $tempo = $numeroAcertos = '';
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$url = "http://teste.sunsalesystem.com.br/api/tabelaDivertida/inserir";
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$headers = array(
	"Content-Type: application/json",
);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
$request->nome = preg_replace('/[^[:alpha:]_]/', '',$request->nome);

$data = <<<DATA
{
    "Nome": '$request->nome',
    "Tempo": '$request->tempo',
    "Tipo": '$request->tipo',
    "Numeroacertos": '$request->acertos',
	"NumeroQuestoes": '$request->NumeroQuestoes'
}
DATA;

curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

$resp = curl_exec($curl);
curl_close($curl);
var_dump($resp);
?>