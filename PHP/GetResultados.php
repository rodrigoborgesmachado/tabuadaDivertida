<?php
include 'bd.php';

echo getResultados($chave);

function getResultados($chave)
{
	$pdo = Conectar();
	if($pdo == null)
	{
		echo '<br>deu ruim';
	}
	else
	{
		$sql = 'SELECT S.NOME, S.NUMEROACERTOS as NUMEROACERTOS, MIN(S.TEMPO) as TEMPO FROM RESULTADOS S GROUP BY S.NOME, S.NUMEROACERTOS ORDER BY S.NUMEROACERTOS desc, TEMPO';
		$stm = $pdo->prepare($sql);
		$stm->execute();
		$pdo = null;	
		return json_encode($stm->fetchAll(PDO::FETCH_ASSOC));
	}
}

?>