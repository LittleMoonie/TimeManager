import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Profile</h1>
      {user && (
        <div>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>
            Name: {user.firstName} {user.lastName}
          </p>
          <p>Role: {user.role?.name}</p>
          <h2>Permissions</h2>
          <ul>
            {user.permissions?.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
