# Generated by Django 4.0.3 on 2022-04-05 20:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0012_post_edited'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
    ]
