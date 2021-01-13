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
		$sql = 'SELECT S.NOME, MIN(S.TEMPO) as TEMPO, MAX(S.NUMEROACERTOS) as NUMEROACERTOS FROM RESULTADOS S GROUP BY S.NOME ORDER BY TEMPO ';
		$stm = $pdo->prepare($sql);
		$stm->execute();
		$pdo = null;	
		return json_encode($stm->fetchAll(PDO::FETCH_ASSOC));
	}
}

?>