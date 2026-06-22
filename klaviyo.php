<?php

$envPath = __DIR__ . '/.env';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse key and value
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        // Remove wrapping quotes if present
        $value = trim($value, '"\'');

        // Force variable into system environment
        putenv("{$name}={$value}");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

function calcularIdade(string $birthday): int
{
    try {
        $dob   = new DateTime($birthday);
        $today = new DateTime('today');
        return (int)$today->diff($dob)->y;
    } catch (Exception $e) {
        return 0;
    }
}

function sendToKlaviyo(array $owner, array $pets): array
{
    $apiKey = getenv('KLAVIYO_API_KEY');
    if (!$apiKey) {
        return ['success' => false, 'message' => 'KLAVIYO_API_KEY not set.'];
    }

    $dataSourceId = getenv('DATA_SOURCE_ID');

    $ownerRelationship = [
        'id'    => 'owner-' . md5($owner['email']),
        'email' => $owner['email'],
    ];
    if (!empty($owner['phone'])) {
        $ownerRelationship['phone'] = $owner['phone'];
    }

    $condicaoLabels = [
        'artrite'             => 'Artrite / Artrose',
        'displasia'           => 'Displasia coxofemoral',
        'dor_articular'       => 'Dor articular',
        'cirurgia_ortopedica' => 'Pós-cirurgia ortopédica',
        'prevencao'           => 'Prevenção (pet saudável)',
        'outro'               => 'Outro',
    ];

    $records = [];
    foreach ($pets as $pet) {
        $birthday = $pet['birthday'];
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday)) {
            $birthday = $birthday . 'T00:00:00Z';
        }

        $uniqueId = 'pet-' . md5($owner['email'] . $pet['nome'] . $pet['birthday']);

        $records[] = [
            'type' => 'data-source-record',
            'attributes' => [
                'record' => [
                    'object_record' => [
                        'id'                      => $uniqueId,
                        'nome'                    => $pet['nome'],
                        'birthday'                => $birthday,
                        'porte'                   => $pet['porte'],
                        'numero_pets'             => $owner['numero_pets'],
                        'condicao_saude'          => $condicaoLabels[$pet['condicao_saude']] ?? $pet['condicao_saude'],
                        'motivo'                  => $pet['motivo'],
                        'primeira_vez_condropure' => $pet['primeira_vez_condropure'],
                        'idade'                   => (int)$pet['idade'],
                    ],
                    'relationships' => [
                        'Pet owner' => [$ownerRelationship],
                    ],
                ],
            ],
        ];
    }

    $payload = [
        'data' => [
            'type' => 'data-source-record-bulk-create-job',
            'attributes' => [
                'data-source-records' => [
                    'data' => $records,
                ],
            ],
            'relationships' => [
                'data-source' => [
                    'data' => [
                        'type' => 'data-source',
                        'id'   => $dataSourceId,
                    ],
                ],
            ],
        ],
    ];

    $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $ch = curl_init('https://a.klaviyo.com/api/data-source-record-bulk-create-jobs/');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $jsonPayload,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/vnd.api+json',
            'Accept: application/vnd.api+json',
            'revision: 2025-07-15',
            'Authorization: Klaviyo-API-Key ' . $apiKey,
        ],
        CURLOPT_TIMEOUT => 15,
    ]);

    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['success' => false, 'message' => 'cURL error: ' . $curlError];
    }

    if (in_array($httpCode, [200, 201, 202, 204])) {
        return ['success' => true];
    }

    $decoded = json_decode($response, true);
    $message = '';
    if (isset($decoded['errors'])) {
        foreach ($decoded['errors'] as $err) {
            $message .= ($err['detail'] ?? $err['title'] ?? '') . ' ';
        }
    }

    return [
        'success' => false,
        'message' => trim($message) ?: "HTTP $httpCode",
    ];
}
