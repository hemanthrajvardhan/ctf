<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Psr7\Response;
use Api\Services\AuthService;
use Api\Middleware\AuthMiddleware;
use Api\Middleware\AdminMiddleware;

session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin) || 
    preg_match('/\.replit\.dev$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

$errorMiddleware = $app->addErrorMiddleware(true, true, true);

$authService = new AuthService();

$app->post('/api/auth/login', function ($request, $response) use ($authService) {
    $data = $request->getParsedBody();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $user = $authService->login($email, $password);
    
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Invalid credentials']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_email'] = $user['email'];

    $response->getBody()->write(json_encode(['user' => $user]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/auth/logout', function ($request, $response) {
    session_destroy();
    $response->getBody()->write(json_encode(['message' => 'Logged out']));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/session', function ($request, $response) use ($authService) {
    if (!isset($_SESSION['user_id'])) {
        $response->getBody()->write(json_encode(['user' => null]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $user = $authService->getUserById($_SESSION['user_id']);
    $response->getBody()->write(json_encode(['user' => $user]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/users', function ($request, $response) use ($authService) {
    $users = $authService->getAllUsers();
    $response->getBody()->write(json_encode($users));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->post('/api/users', function ($request, $response) use ($authService) {
    $data = $request->getParsedBody();
    
    try {
        $user = $authService->createUser(
            $data['email'],
            $data['name'],
            $data['password'],
            $data['role'] ?? 'player'
        );
        
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->get('/api/profile', function ($request, $response) use ($authService) {
    $userId = $request->getAttribute('user_id');
    $user = $authService->getUserById($userId);
    $response->getBody()->write(json_encode($user));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AuthMiddleware());

$app->get('/api/health', function ($request, $response) {
    $response->getBody()->write(json_encode(['status' => 'ok']));
    return $response->withHeader('Content-Type', 'application/json');
});

$challengeService = new \Api\Services\ChallengeService();
$submissionService = new \Api\Services\SubmissionService();

$app->get('/api/challenges', function ($request, $response) use ($challengeService) {
    $challenges = $challengeService->getAllChallenges();
    $response->getBody()->write(json_encode($challenges));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/challenges/{slug}', function ($request, $response, $args) use ($challengeService) {
    $challenge = $challengeService->getChallengeBySlug($args['slug']);
    if (!$challenge) {
        $response->getBody()->write(json_encode(['error' => 'Challenge not found']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
    $response->getBody()->write(json_encode($challenge));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/challenges', function ($request, $response) use ($challengeService) {
    $data = $request->getParsedBody();
    try {
        $challenge = $challengeService->createChallenge(
            $data['title'],
            $data['slug'],
            $data['description'],
            $data['category'],
            $data['points'],
            $data['flag']
        );
        $response->getBody()->write(json_encode($challenge));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->patch('/api/challenges/{id}', function ($request, $response, $args) use ($challengeService) {
    $data = $request->getParsedBody();
    try {
        $challenge = $challengeService->updateChallenge(
            $args['id'],
            $data['title'],
            $data['slug'],
            $data['description'],
            $data['category'],
            $data['points'],
            $data['flag'] ?? null
        );
        $response->getBody()->write(json_encode($challenge));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->delete('/api/challenges/{id}', function ($request, $response, $args) use ($challengeService) {
    $challengeService->deleteChallenge($args['id']);
    $response->getBody()->write(json_encode(['message' => 'Challenge deleted']));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->post('/api/submissions', function ($request, $response) use ($submissionService) {
    $data = $request->getParsedBody();
    $userId = $request->getAttribute('user_id');
    
    try {
        $submission = $submissionService->submitFlag(
            $userId,
            $data['challenge_id'],
            $data['flag']
        );
        $response->getBody()->write(json_encode($submission));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AuthMiddleware());

$app->get('/api/submissions', function ($request, $response) use ($submissionService) {
    $userId = $request->getAttribute('user_id');
    $submissions = $submissionService->getUserSubmissions($userId);
    $response->getBody()->write(json_encode($submissions));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AuthMiddleware());

$app->get('/api/submissions/solved', function ($request, $response) use ($submissionService) {
    $userId = $request->getAttribute('user_id');
    $solved = $submissionService->getUserSolvedChallenges($userId);
    $response->getBody()->write(json_encode($solved));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AuthMiddleware());

$app->get('/api/leaderboard', function ($request, $response) use ($submissionService) {
    $leaderboard = $submissionService->getLeaderboard();
    $response->getBody()->write(json_encode($leaderboard));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
