from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with initial users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing users before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing users...')
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Users cleared!'))

        self.stdout.write('Creating initial users...')

        users_data = [
            {
                'username': 'admin',
                'email': 'admin@whiteboard.com',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
                'bio': 'System Administrator',
                'company': 'Whiteboard Inc.',
            },
            {
                'username': 'alice',
                'email': 'alice@example.com',
                'password': 'password123',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'bio': 'Product Designer passionate about UX',
                'company': 'Design Co.',
            },
            {
                'username': 'bob',
                'email': 'bob@example.com',
                'password': 'password123',
                'first_name': 'Bob',
                'last_name': 'Smith',
                'bio': 'Software Engineer',
                'company': 'Tech Corp',
            },
            {
                'username': 'charlie',
                'email': 'charlie@example.com',
                'password': 'password123',
                'first_name': 'Charlie',
                'last_name': 'Brown',
                'bio': 'Marketing Manager',
                'company': 'Marketing Agency',
            },
            {
                'username': 'diana',
                'email': 'diana@example.com',
                'password': 'password123',
                'first_name': 'Diana',
                'last_name': 'Prince',
                'bio': 'Project Manager',
                'company': 'Startup Inc.',
            },
            {
                'username': 'demo',
                'email': 'demo@whiteboard.com',
                'password': 'demo123',
                'first_name': 'Demo',
                'last_name': 'User',
                'bio': 'Demo account for testing',
                'company': 'Whiteboard Inc.',
            },
        ]

        created_users = []
        for user_data in users_data:
            password = user_data.pop('password')
            
            # Check if user already exists
            if User.objects.filter(username=user_data['username']).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {user_data["username"]} already exists, skipping...')
                )
                continue

            user = User.objects.create_user(
                password=password,
                **user_data
            )
            created_users.append(user)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Created user: {user.username} ({user.email})')
            )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Successfully created {len(created_users)} users!')
        )
        
        # Display login credentials
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('LOGIN CREDENTIALS:'))
        self.stdout.write('='*60)
        self.stdout.write('Admin: admin / admin123')
        self.stdout.write('Demo:  demo / demo123')
        self.stdout.write('Users: alice, bob, charlie, diana / password123')
        self.stdout.write('='*60 + '\n')