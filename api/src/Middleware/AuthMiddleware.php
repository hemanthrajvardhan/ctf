<?php

namespace Api\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response;

class AuthMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        if (!isset($_SESSION['user_id'])) {
            $response = new Response();
            $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(401);
        }

        $request = $request->withAttribute('user_id', $_SESSION['user_id']);
        $request = $request->withAttribute('user_role', $_SESSION['user_role']);
        return $handler->handle($request);
    }
}
