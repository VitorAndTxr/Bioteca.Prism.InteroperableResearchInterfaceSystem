## Purpose

Corrigir fluxos de consumo e persistencias de dados de stream do protocolo bluetooth `/apps/mobile` na tela de `Session` que atualmente estão incorretos na plataforma

## Problemas

-  Exportação de arquivos da dessão em histórico devolve apenas um csv com as informações desorganizadas
    Comportamento esperado: Exportação de arquivos da sessão deveria ser zip composto por um json com as informações da sessão e das sessões de gravação com arquivos csv referentes a cada canal linkados com o JSON da sessão

- O arquivo csv enviado para o blob é um arquivo com cabeçalho vazio
    Comportamento esperado: O arquivo csv enviado para o blob deve conter informações de sinal do stream do sinal sEMG do bluetooth

- Tela de Recording está com frequencia errada de captura e exibição de gráfico
    Comportamento esperado: 
    - Frequencia padrão de 215 hz inalteravel
    - Grafico na tela exibindo apenas os ultimos 4 segundos do stream downsampled para 40hz atualizado 1 vez por segundo


