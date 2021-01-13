<?php
include 'bd.php';

$nome = $tempo = $numeroAcertos = '';
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
// $nome = isset($_POST['nome']) ? $_POST['nome'] : '-';
// $tempo = isset($_POST['tempo']) ? $_POST['tempo'] : '01:59:59';
// $numeroAcertos = isset($_POST['numeroAcertos']) ? $_POST['numeroAcertos'] : '100';

// echo setResultado($nome, $tempo, $numeroAcertos);
echo setResultado(preg_replace('/[^[:alpha:]_]/', '',$request->nome), $request->tempo, '20');
function setResultado($nome, $tempo, $numeroAcertos)
{
	$pdo = Conectar();
	$result = 'True';

	if($pdo == null || $nome == '-')
	{
		$result = 'False';
	}
	else
	{
		$sql = 'INSERT INTO RESULTADOS (NOME, TEMPO, NUMEROACERTOS) 
			    VALUES (?, ?, ?)';
		$stm = $pdo->prepare($sql);
		$stm->bindValue(1, $nome);
		$stm->bindValue(2, $tempo);
		$stm->bindValue(3, $numeroAcertos);
		
		if($stm->execute() == false)
		{
			$result = 'False';
		}

		$pdo = null;	
	}
	
	$r['Result'] = $result;	
	$r['nome'] = $nome;	
	$r['tempo'] = $tempo;	
	return json_encode($r);
}

?>