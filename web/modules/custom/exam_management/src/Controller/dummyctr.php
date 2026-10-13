<?php

namespace Drupal\exam_management\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final class AccountController extends ControllerBase {

  /**
   * Return currently logged-in user.
   */
  public function me(Request $request): JsonResponse {

    $account = \Drupal::currentUser();

    $is_admin =
      $account->isAuthenticated() &&
      $account->hasRole('administrator');

    return $this->corsJson([
      'uid' => (int) $account->id(),

      'name' =>
        $account->getAccountName(),

      'roles' =>
        array_values(
          $account->getRoles()
        ),

      'isAdmin' =>
        $is_admin,

      'isStudent' =>
        $account->isAuthenticated() &&
        !$is_admin,

      'canManage' =>
        $is_admin,

    ], 200, $request);
  }


  /**
   * Login.
   */
  public function login(Request $request): JsonResponse {

    if ($request->isMethod('OPTIONS')) {
      return $this->corsJson(
        [],
        204,
        $request
      );
    }

    $data =
      json_decode(
        $request->getContent(),
        TRUE
      ) ?: [];


    $username =
      trim(
        (string) (
          $data['name'] ?? ''
        )
      );

    $password =
      (string) (
        $data['pass'] ?? ''
      );

    $mode =
      (string) (
        $data['mode'] ?? 'student'
      );


    if (
      $username === '' ||
      $password === ''
    ) {

      return $this->corsJson([
        'message' =>
          'Username and password are required.',
      ], 422, $request);
    }


    $uid =
      \Drupal::service('user.auth')
        ->authenticate(
          $username,
          $password
        );


    if (!$uid) {

      return $this->corsJson([
        'message' =>
          'Invalid username or password.',
      ], 401, $request);
    }


    $account =
      User::load($uid);


    if (
      !$account ||
      !$account->isActive()
    ) {

      return $this->corsJson([
        'message' =>
          'This account is not active.',
      ], 403, $request);
    }


    $is_admin =
      $account->hasRole('administrator');


    if (
      $mode === 'admin' &&
      !$is_admin
    ) {

      return $this->corsJson([
        'message' =>
          'This account is not an administrator.',
      ], 403, $request);
    }


    if (
      $mode === 'student' &&
      $is_admin
    ) {

      return $this->corsJson([
        'message' =>
          'Administrators must use the Admin Login.',
      ], 403, $request);
    }


    user_login_finalize($account);


    return $this->corsJson([
      'message' =>
        'Login successful.',
    ], 200, $request);
  }


  /**
   * Logout.
   */
  public function logout(Request $request): JsonResponse {

    if ($request->isMethod('OPTIONS')) {
      return $this->corsJson(
        [],
        204,
        $request
      );
    }


    user_logout();


    return $this->corsJson([
      'message' =>
        'Logged out.',
    ], 200, $request);
  }


  /**
   * Register student.
   */
  public function register(Request $request): JsonResponse {

    if ($request->isMethod('OPTIONS')) {
      return $this->corsJson(
        [],
        204,
        $request
      );
    }


    $data =
      json_decode(
        $request->getContent(),
        TRUE
      ) ?: [];


    $name =
      trim(
        (string) (
          $data['name'] ?? ''
        )
      );

    $mail =
      trim(
        (string) (
          $data['mail'] ?? ''
        )
      );

    $pass =
      (string) (
        $data['pass'] ?? ''
      );


    if (
      $name === '' ||
      $mail === '' ||
      $pass === '' ||
      !filter_var(
        $mail,
        FILTER_VALIDATE_EMAIL
      )
    ) {

      return $this->corsJson([
        'message' =>
          'Supply a username, valid email, and password.',
      ], 422, $request);
    }


    if (user_load_by_name($name)) {

      return $this->corsJson([
        'message' =>
          'Username already exists.',
      ], 409, $request);
    }


    if (user_load_by_mail($mail)) {

      return $this->corsJson([
        'message' =>
          'Email already exists.',
      ], 409, $request);
    }


    $user =
      User::create([
        'name' =>
          $name,

        'mail' =>
          $mail,

        'pass' =>
          $pass,

        'status' =>
          1,
      ]);


    $violations =
      $user->validate();


    if (count($violations)) {

      $messages = [];

      foreach ($violations as $violation) {

        $messages[] =
          $violation->getMessage();
      }


      return $this->corsJson([
        'message' =>
          implode(
            ' ',
            $messages
          ),
      ], 422, $request);
    }


    $user->save();


    return $this->corsJson([
      'message' =>
        'Student account created successfully.',
    ], 201, $request);
  }


  /**
   * =====================================================
   * DELETE CONTENT
   * =====================================================
   *
   * Deletes Exam, Subject, Material or Quiz.
   *
   * React sends:
   *
   * POST /api/exam-management/delete
   *
   * {
   *   "type": "exam",
   *   "id": "UUID"
   * }
   */
  public function deleteContent(
    Request $request
  ): JsonResponse {

    if ($request->isMethod('OPTIONS')) {

      return $this->corsJson(
        [],
        204,
        $request
      );
    }


    /*
     * Only authenticated users
     * are allowed to continue.
     */
    $account =
      \Drupal::currentUser();


    if (
      !$account->isAuthenticated()
    ) {

      return $this->corsJson([
        'message' =>
          'You must be logged in.',
      ], 401, $request);
    }


    /*
     * Only administrator can delete.
     */
    if (
      !$account->hasRole('administrator')
    ) {

      return $this->corsJson([
        'message' =>
          'Only administrators can delete content.',
      ], 403, $request);
    }


    /*
     * Read JSON.
     */
    $data =
      json_decode(
        $request->getContent(),
        TRUE
      ) ?: [];


    $type =
      trim(
        (string) (
          $data['type'] ?? ''
        )
      );


    $id =
      trim(
        (string) (
          $data['id'] ?? ''
        )
      );


    /*
     * Allowed content types.
     */
    $allowed_types = [
      'exam',
      'subject',
      'material',
      'quiz',
    ];


    if (
      !in_array(
        $type,
        $allowed_types,
        TRUE
      )
    ) {

      return $this->corsJson([
        'message' =>
          'Invalid content type.',
      ], 400, $request);
    }


    if ($id === '') {

      return $this->corsJson([
        'message' =>
          'Content ID is required.',
      ], 400, $request);
    }


    /*
     * Load node by UUID.
     *
     * IMPORTANT:
     * React sends UUID, not node ID.
     */
    $storage =
      \Drupal::entityTypeManager()
        ->getStorage('node');


    $nodes =
      $storage->loadByProperties([
        'uuid' => $id,
        'type' => $type,
      ]);


    if (empty($nodes)) {

      return $this->corsJson([
        'message' =>
          ucfirst($type) .
          ' not found for UUID: ' .
          $id,
      ], 404, $request);
    }


    /*
     * Get the node.
     */
    $node =
      reset($nodes);


    /*
     * Check Drupal entity access.
     */
    if (
      !$node->access(
        'delete',
        $account
      )
    ) {

      return $this->corsJson([
        'message' =>
          'You do not have permission to delete this content.',
      ], 403, $request);
    }


    /*
     * Delete the node.
     */
    try {

      $node->delete();

    }
    catch (\Throwable $e) {

      \Drupal::logger(
        'exam_management'
      )->error(
        'Delete failed: @message',
        [
          '@message' =>
            $e->getMessage(),
        ]
      );


      return $this->corsJson([
        'message' =>
          'Drupal could not delete this content.',
      ], 500, $request);
    }


    return $this->corsJson([
      'message' =>
        ucfirst($type) .
        ' deleted successfully.',
    ], 200, $request);
  }


  /**
   * CORS helper.
   */
  private function corsJson(
    array $data,
    int $status,
    Request $request
  ): JsonResponse {

    $response =
      new JsonResponse(
        $data,
        $status
      );


    $origin =
      $request->headers->get(
        'Origin'
      );


    $allowed_origins = [

      'http://localhost:3000',

      'http://localhost:5173',

      'http://localhost:5174',

    ];


    if (
      in_array(
        $origin,
        $allowed_origins,
        TRUE
      )
    ) {

      $response->headers->set(
        'Access-Control-Allow-Origin',
        $origin
      );

      $response->headers->set(
        'Access-Control-Allow-Credentials',
        'true'
      );

      $response->headers->set(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
      );

      $response->headers->set(
        'Access-Control-Allow-Headers',
        'Content-Type, X-CSRF-Token, Accept'
      );

      $response->headers->set(
        'Vary',
        'Origin'
      );
    }


    return $response;
  }

}
