<?php

// Suppress warnings and notices that break JSON responses
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', '0');

require_once __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Psr7\Response;
use Api\Services\AuthService;
use Api\Middleware\AuthMiddleware;
use Api\Middleware\AdminMiddleware;

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
$hintService = new \Api\Services\HintService();
$categoryService = new \Api\Services\CategoryService();

$app->post('/api/users/{id}/ban', function ($request, $response, $args) use ($authService) {
    $authService->banUser($args['id']);
    $response->getBody()->write(json_encode(['message' => 'User banned successfully']));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->post('/api/users/{id}/unban', function ($request, $response, $args) use ($authService) {
    $authService->unbanUser($args['id']);
    $response->getBody()->write(json_encode(['message' => 'User unbanned successfully']));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->get('/api/challenges', function ($request, $response) use ($challengeService) {
    $userRole = $request->getAttribute('user_role');
    $includeHidden = ($userRole === 'admin');
    $challenges = $challengeService->getAllChallenges($includeHidden);
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
            $data['flag'],
            $data['round'] ?? null,
            $data['image_url'] ?? null,
            $data['external_link'] ?? null,
            $data['is_visible'] ?? true
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
            $data['flag'] ?? null,
            $data['round'] ?? null,
            $data['image_url'] ?? null,
            $data['external_link'] ?? null,
            $data['is_visible'] ?? true
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

$app->get('/api/users/{id}/submissions', function ($request, $response, $args) use ($submissionService) {
    $submissions = $submissionService->getUserSubmissions($args['id']);
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

$app->get('/api/challenges/{id}/hints', function ($request, $response, $args) use ($hintService) {
    $hints = $hintService->getHintsForChallenge($args['id']);
    $response->getBody()->write(json_encode($hints));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/challenges/{id}/hints', function ($request, $response, $args) use ($hintService) {
    $data = $request->getParsedBody();
    try {
        $hint = $hintService->createHint(
            $args['id'],
            $data['content'],
            $data['cost'] ?? 0,
            $data['unlock_time'] ?? 0,
            $data['position'] ?? 0
        );
        $response->getBody()->write(json_encode($hint));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->patch('/api/hints/{id}', function ($request, $response, $args) use ($hintService) {
    $data = $request->getParsedBody();
    try {
        $hintService->updateHint(
            $args['id'],
            $data['content'],
            $data['cost'],
            $data['unlock_time'],
            $data['position']
        );
        $response->getBody()->write(json_encode(['message' => 'Hint updated successfully']));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->delete('/api/hints/{id}', function ($request, $response, $args) use ($hintService) {
    $hintService->deleteHint($args['id']);
    $response->getBody()->write(json_encode(['message' => 'Hint deleted successfully']));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->get('/api/categories', function ($request, $response) use ($categoryService) {
    $categories = $categoryService->getAllCategories();
    $response->getBody()->write(json_encode($categories));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/categories/{type}', function ($request, $response, $args) use ($categoryService) {
    $categories = $categoryService->getCategoriesByType($args['type']);
    $response->getBody()->write(json_encode($categories));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/categories', function ($request, $response) use ($categoryService) {
    $data = $request->getParsedBody();
    try {
        $category = $categoryService->createCategory(
            $data['name'],
            $data['type'] ?? 'category',
            $data['color'] ?? null
        );
        $response->getBody()->write(json_encode($category));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->delete('/api/categories/{id}', function ($request, $response, $args) use ($categoryService) {
    $categoryService->deleteCategory($args['id']);
    $response->getBody()->write(json_encode(['message' => 'Category deleted successfully']));
    return $response->withHeader('Content-Type', 'application/json');
})->add(new AdminMiddleware())->add(new AuthMiddleware());

$app->run();
