# Generated by Django 2.2.3 on 2019-07-19 22:19

from django.db import migrations, models
import django.db.models.deletion
import wagtail.core.blocks
import wagtail.core.fields
import wagtail.images.blocks


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('wagtailimages', '0001_squashed_0021'),
        ('wagtailcore', '0041_group_collection_permissions_verbose_name_plural'),
    ]

    operations = [
        migrations.CreateModel(
            name='MasonryPage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.Page')),
                ('author', models.CharField(max_length=255)),
                ('date', models.DateField(verbose_name='Post date')),
                ('body', wagtail.core.fields.StreamField([('heading', wagtail.core.blocks.CharBlock(classname='full title')), ('paragraph', wagtail.core.blocks.RichTextBlock()), ('image', wagtail.images.blocks.ImageChooserBlock())])),
            ],
        ),
        migrations.CreateModel(
            name='ConnectPage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.Page')),
                ('grid_cta_one', wagtail.core.fields.RichTextField()),
                ('grid_cta_two', wagtail.core.fields.RichTextField()),
                ('grid_cta_three', wagtail.core.fields.RichTextField()),
                ('body', wagtail.core.fields.RichTextField()),
                ('cta_list', wagtail.core.fields.StreamField([('connection', wagtail.core.blocks.StructBlock([('cta_title', wagtail.core.blocks.CharBlock()), ('cta_content', wagtail.core.blocks.RichTextBlock()), ('cta_link', wagtail.core.blocks.URLBlock(label='URL', required=False))])), ('details', wagtail.core.blocks.RichTextBlock())])),
                ('date', models.DateField(verbose_name='Post date')),
                ('body_image', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailimages.Image')),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
    ]
