from django.core.management.base import BaseCommand
from django.db import transaction
from boards.models import Whiteboard, WhiteboardPermission  # This is correct
from canvas.models import CanvasObject  # This is correct
import random

class Command(BaseCommand):
    help = 'Seed the database with initial whiteboards and canvas objects'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            CanvasObject.objects.all().delete()
            WhiteboardPermission.objects.all().delete()
            Whiteboard.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Data cleared!'))

        self.stdout.write('Creating initial whiteboards...')

        # User IDs from auth-service (assuming they exist)
        # 1: admin, 2: alice, 3: bob, 4: charlie, 5: diana, 6: demo
        
        whiteboards_data = [
            {
                'name': 'Product Roadmap 2025',
                'owner_id': 2,
                'is_public': True,
                'share_code': 'ROADMAP2025',
            },
            {
                'name': 'Team Brainstorming',
                'owner_id': 3,
                'is_public': True,
                'share_code': 'BRAINSTORM',
            },
            {
                'name': 'Marketing Campaign Ideas',
                'owner_id': 4,
                'is_public': False,
            },
            {
                'name': 'Project Planning',
                'owner_id': 5,
                'is_public': True,
                'share_code': 'PROJECT2025',
            },
            {
                'name': 'Demo Whiteboard',
                'owner_id': 6,
                'is_public': True,
                'share_code': 'DEMO123',
            },
            {
                'name': 'Design System',
                'owner_id': 2,
                'is_public': False,
            },
        ]

        created_boards = []
        for board_data in whiteboards_data:
            whiteboard = Whiteboard.objects.create(**board_data)
            created_boards.append(whiteboard)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Created whiteboard: {whiteboard.name}')
            )

        # Add permissions
        self.stdout.write('\nAdding permissions...')
        permissions_data = [
            # Product Roadmap - shared with team
            {'whiteboard': created_boards[0], 'user_id': 3, 'permission_level': 'edit'},
            {'whiteboard': created_boards[0], 'user_id': 5, 'permission_level': 'view'},
            
            # Team Brainstorming - everyone can edit
            {'whiteboard': created_boards[1], 'user_id': 2, 'permission_level': 'edit'},
            {'whiteboard': created_boards[1], 'user_id': 4, 'permission_level': 'edit'},
            {'whiteboard': created_boards[1], 'user_id': 5, 'permission_level': 'edit'},
            
            # Marketing Campaign - charlie's private board with diana viewing
            {'whiteboard': created_boards[2], 'user_id': 5, 'permission_level': 'view'},
            
            # Project Planning - diana shares with alice
            {'whiteboard': created_boards[3], 'user_id': 2, 'permission_level': 'edit'},
        ]

        for perm_data in permissions_data:
            WhiteboardPermission.objects.create(**perm_data)
        
        self.stdout.write(
            self.style.SUCCESS(f'✓ Created {len(permissions_data)} permissions')
        )

        # Add some canvas objects to Demo Whiteboard
        self.stdout.write('\nAdding sample canvas objects to Demo Whiteboard...')
        
        demo_board = created_boards[4]  # Demo Whiteboard
        
        canvas_objects_data = [
            # Welcome text
            {
                'whiteboard': demo_board,
                'object_type': 'text',
                'x': 100,
                'y': 100,
                'width': 300,
                'height': 50,
                'color': '#1E40AF',
                'z_index': 1,
                'created_by': 6,
                'data': {
                    'content': 'Welcome to Collaborative Whiteboard!',
                    'fontSize': 24,
                    'fontFamily': 'Arial',
                }
            },
            # Sticky note
            {
                'whiteboard': demo_board,
                'object_type': 'sticky_note',
                'x': 150,
                'y': 200,
                'width': 200,
                'height': 150,
                'color': '#FBBF24',
                'z_index': 2,
                'created_by': 6,
                'data': {
                    'content': 'This is a sticky note!\n\nYou can add ideas here.',
                    'noteColor': '#FEF3C7',
                }
            },
            # Rectangle
            {
                'whiteboard': demo_board,
                'object_type': 'rectangle',
                'x': 400,
                'y': 200,
                'width': 200,
                'height': 150,
                'color': '#10B981',
                'stroke_width': 3,
                'z_index': 1,
                'created_by': 6,
                'data': {}
            },
            # Circle
            {
                'whiteboard': demo_board,
                'object_type': 'circle',
                'x': 650,
                'y': 200,
                'width': 150,
                'height': 150,
                'color': '#EF4444',
                'stroke_width': 3,
                'z_index': 1,
                'created_by': 6,
                'data': {}
            },
            # Arrow
            {
                'whiteboard': demo_board,
                'object_type': 'arrow',
                'x': 250,
                'y': 400,
                'width': 200,
                'height': 0,
                'color': '#8B5CF6',
                'stroke_width': 3,
                'z_index': 1,
                'created_by': 6,
                'data': {
                    'startX': 250,
                    'startY': 400,
                    'endX': 450,
                    'endY': 400,
                }
            },
            # Freehand drawing
            {
                'whiteboard': demo_board,
                'object_type': 'freehand',
                'x': 500,
                'y': 400,
                'width': 200,
                'height': 100,
                'color': '#EC4899',
                'stroke_width': 2,
                'z_index': 1,
                'created_by': 6,
                'data': {
                    'points': [
                        [500, 400], [510, 410], [520, 420], [530, 425],
                        [540, 430], [550, 435], [560, 440], [570, 445],
                        [580, 450], [590, 455], [600, 460],
                    ]
                }
            },
        ]

        for obj_data in canvas_objects_data:
            CanvasObject.objects.create(**obj_data)
        
        self.stdout.write(
            self.style.SUCCESS(f'✓ Created {len(canvas_objects_data)} canvas objects')
        )

        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('🎉 DATABASE SEEDED SUCCESSFULLY!'))
        self.stdout.write('='*60)
        self.stdout.write(f'Whiteboards: {len(created_boards)}')
        self.stdout.write(f'Permissions: {len(permissions_data)}')
        self.stdout.write(f'Canvas Objects: {len(canvas_objects_data)}')
        self.stdout.write('='*60)
        self.stdout.write('\nSample Whiteboards:')
        for wb in created_boards:
            self.stdout.write(f'  • {wb.name} (Owner ID: {wb.owner_id})')
            if wb.share_code:
                self.stdout.write(f'    Share Code: {wb.share_code}')
        self.stdout.write('='*60 + '\n')